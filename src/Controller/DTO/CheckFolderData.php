<?php

namespace ShopelfenStore\Controller\DTO;

use Symfony\Component\Validator\Attribute\HasNamedArguments;
use Symfony\Component\Validator\Constraints as Assert;

class CheckFolderData
{
    #[Assert\NotBlank]
    #[Assert\Type('string')]
    public readonly string $folderName;

    #[HasNamedArguments]
    public function __construct(string $folderName)
    {
        $this->folderName = $folderName;
    }

}
