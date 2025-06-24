# Shopelfen Store Plugin

## Grundlegende Struktur

 - Controller/ExtensionReceiveController.php
 - Service/LicenseGuard.php
 - JS

## ExtensionReceiver

Der ExtensionReceiver ist ein Controller, der die Anfragen von der Shopelfen Extension-Api empfängt.
Er fängt die darin enthaltene Zip Datei ab und entpackt sie in den Ordner `custom/plugins`.

Das Empfangen der Anfrage erfolgt über die Route die für den Store geöffnet wird und wird mit unserem Sicherheits-Token, welches der Kunde in den Einstellungen hinterlegt, abgesichert.

## LicenseGuard

Der LicenseGuard ist ein Service, der die Lizenzprüfung für die Plugins übernimmt.
Er prüft, ob die Lizenz für das Plugin gültig ist indem er unsere Server anfragt und ob der Kunde berechtigt ist, das Plugin zu nutzen.

Die Verwendung des LicenseGuards erfolgt in den einzelnen Extensions. Die Entwirkler haben die Möglichkeit den LicenseGuard aus unserem Plugin zu verwenden, da er öffentlich in Shopware als Service registriert wird. 

Ist unser Plugin nicht installiert, so wird der LicenseGuard nicht registriert und die initialisierung des Plugins schlägt an den von den Entwicklern gewählten Punkten fehl.

Somit ist das Plugin primär über den LicenseGuard abgesichert.

## JavaScript

Unter Resources/app/administration/src wird das JavaScript für das Plugin geladen.

Die `main.js` Datei initialisiert das Plugin, registriert die Snippets und die Services und Module.

Es gibt 4 wichtige Punkte.

1. `shopelfen-settings`
2. `shopelfen-store`
3. `service`

### General

Die komponenten befinden sich unter `custom/plugins/ShopelfenStore/src/Resources/app/administration/src`

### Shopelfen Settings  -> `/module/shopelfen-settings`

Die Shopelfen Settings registrieren ihre eigenen Components, Pages und Snippets.
Unter der index.js werden die Komponenten, die Snippets und die Pages geladen und registriert.

Die Komponenten berschreiben hier nur den hx-verification-state. Ein Button, der die Verifikation der Stores über die API mittels der StoreNumber und dem Sicherheits-Token anstößt.

Die config-Page stellt eine card dar die die Textfelder hierfür übernimmt und die Notification anzeigt, wie die Verifikation war.

### Shopelfen Store -> `/module/shopelfen-store`

Die Grundlegenden Teile des Shopelfen Stores sind:

#### die License Page 
diese zeigt die aktuellen Lizenzen des Kunden anzeigt sollte er authentifiziert sein.

#### die License Card Komponente

diese zeigt die aktuelle Version des Plugins den stand ob installiert oder deinstalliert. Ob das Plugin Updatable ist, ob es aktiv ist und wann dieses ausläuft beziehungsweise verlängert wird.

#### Die License Card Controls

diese Zeigen den refresh Button und das ausblenden inaktiver Lizenzen im header der License Page an.

### Service

Der Service wird über Javscript im init ordner initialisert. Dieser stell die Ausgehende Verbindung vom Store zu unsere Servern bereit und kommuniziert mit der Extension-Api.

Der service kann in den einzelnen Komponenten, sei es Page oder Component injected werden und stellt die Methoden bereit, die für die Kommunikation mit der Extension-Api benötigt werden.




