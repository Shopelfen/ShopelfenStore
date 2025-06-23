<?php declare(strict_types=1);

namespace ShopelfenStore\Controller;

use Composer\IO\NullIO;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Plugin\PluginManagementService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Filesystem\Filesystem;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Plugin\PluginService;
use Shopware\Core\Framework\Plugin\PluginLifecycleService;
use Shopware\Core\Framework\Migration\MigrationCollectionLoader;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[Route(defaults: ['_routeScope' => ['api']])]
class UpdateRunningController extends AbstractController
{
    public function __construct(
        private readonly Filesystem                $fs,
        private readonly KernelInterface           $kernel,
        private readonly PluginManagementService   $pluginManagementService,
        private readonly PluginService             $pluginService,
        private readonly PluginLifecycleService    $coreLifecycle,
        private readonly MigrationCollectionLoader $migrationLoader,
        #[Autowire('shopware.repository.plugin')]
        private readonly EntityRepository          $pluginRepo
    ) {}

    #[Route("/api/shopelfen/update", name: "api.shopelfen.update", methods: ["POST"])]
    public function receive(Request $request): JsonResponse
    {
        $pluginName = $request->request->get('pluginName');
        $tempPath   = __DIR__ . '/../../tmp/' . $pluginName;

        if (!$pluginName) {
            return new JsonResponse([
                'success' => false,
                'error'   => 'Fehlende Parameter pluginName'
            ], 400);
        }

        $projectDir = $this->getParameter('kernel.project_dir');
        $targetPath = $projectDir . '/custom/plugins/' . $pluginName;

        $type = $this->pluginManagementService->extractPluginZip($tempPath . ".zip", true);

        try {

            // 2) Kontext & alte Version lesen
            $context = Context::createDefaultContext();
            $criteria = (new Criteria())->addFilter(new EqualsFilter('name', $pluginName));
            $pluginEntity = $this->pluginRepo->search($criteria, $context)->first();
            if (!$pluginEntity) {
                throw new \RuntimeException("Plugin-Entity für '$pluginName' nicht gefunden.");
            }
            $oldVersion = $pluginEntity->getVersion();

            // 3) Neue Version aus composer.json
            $composerFile = $targetPath . '/composer.json';
            if (!file_exists($composerFile)) {
                throw new \RuntimeException("composer.json in '$targetPath' fehlt.");
            }
            $data = json_decode((string) file_get_contents($composerFile), true, JSON_THROW_ON_ERROR);
            $newVersion = $data['version'] ?? throw new \RuntimeException("version fehlt in composer.json.");

            // 4) Migrations für die neue Version sammeln
            $migrations = $this->migrationLoader->collectAllForVersion($newVersion);

            // 5) Plugin-Instanz laden & UpdateContext bauen
            $pluginEntity = $this->pluginService->getPluginByName($pluginName, $context);
            if (!$pluginEntity) {
                throw new \RuntimeException("Plugin-Instanz für '$pluginName' nicht geladen.");
            }

            $bundles = $this->kernel->getBundles();
            if (!\array_key_exists($pluginName, $bundles)) {
                throw new \RuntimeException("Plugin-Bundle '$pluginName' nicht geladen.");
            }

            // 6) Update & Reaktivierung
            $this->coreLifecycle->updatePlugin($pluginEntity, $context);
            $this->coreLifecycle->activatePlugin($pluginEntity, $context);

            // 7) Plugin-Liste (Cache) neu laden
            $this->pluginService->refreshPlugins($context, new NullIO());

            return new JsonResponse(['success' => true]);
        } catch (\Throwable $e) {
            return new JsonResponse([
                'success' => false,
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}