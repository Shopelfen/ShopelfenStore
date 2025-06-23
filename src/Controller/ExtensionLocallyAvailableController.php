<?php

namespace ShopelfenStore\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class ExtensionLocallyAvailableController extends AbstractController
{

    #[Route("/api/shopelfen/extension-locally-available", name: "api.shopelfen.extension-locally-available", methods: ["POST"])]
    public function checkExtensionDownloaded(Request $request): JsonResponse{

        $pluginName = $request->request->get("pluginName");

        if(!$pluginName){
            return new JsonResponse(['error' => 'Plugin name is required'], 400);
        }

        $customTmp = __DIR__ . '/../../tmp';

        return new JsonResponse(['type' => 'success', 'status' => is_file($customTmp . '/' . $pluginName . '.zip') ? 'available' : 'not_available']);

    }
}