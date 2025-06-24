<?php declare(strict_types=1);

namespace ShopelfenStore\Controller;

use ShopelfenStore\Controller\DTO\CheckFolderData;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class DirectoryCheckController extends AbstractController
{
    #[Route(path: '/api/_action/shopelfen/check-plugin-folder', name: 'api.shopelfen.check_plugin_folder', methods: ['POST'])]
    public function checkFolderPath(#[MapRequestPayload] CheckFolderData $folderData): JsonResponse
    {
        // Only allow names, no paths
        $pluginName = basename($folderData->folderName);

        $pluginPath = sprintf('%s/../custom/plugins/%s', __DIR__, $pluginName);

        return new JsonResponse([
            'exists' => is_dir($pluginPath),
            'path' => realpath($pluginPath) ?: $pluginPath,
        ]);
    }

}
