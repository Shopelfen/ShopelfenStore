<?php

namespace ShopelfenStore\Controller;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Plugin\PluginManagementService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class UpdateReceiverController extends AbstractController
{
    public function __construct(
        private readonly PluginManagementService $pluginManagementService,
    ) {
    }


    #[Route("/api/shopelfen/update-receiver", name: "api.shopelfen.update-receiver", methods: ["POST"])]
    public function receiveUpdate(Request $request, Context $context): JsonResponse
    {
        $customTmp = __DIR__ . '/../../tmp';
        if (!is_dir($customTmp)) {
            mkdir($customTmp, 0777, true);
        }

        /** @var UploadedFile|null $file */
        $file = $request->files->get('file');
        if (!$file || !$file->isValid()) {
            return new JsonResponse(['error' => 'File missing or invalid'], 400);
        }

        $target = $customTmp . '/' . $file->getClientOriginalName();
        $file->move(dirname($target), basename($target));

        // TODO: Implement logic
        //$type = $this->pluginManagementService->extractPluginZip($target, true);

        return new JsonResponse(['type' => 'success', 'status' => 'written', 'target' => $target]);
    }
}