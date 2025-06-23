# Unterscheidung zwischen APP und PLUGIN

Es gibt mittlerweile zwei Möglichkeiten um eine Erweiterung zu erstellen:
# APP
Eine APP ist eine Erweiterung, die in der Shopware Cloud betrieben wird. Sie kann über den Shopware Account verwaltet und installiert werden. APPs sind in der Regel für die Nutzung in der Cloud optimiert und bieten eine einfache Möglichkeit, Funktionen zu erweitern.

# PLUGIN
Ein PLUGIN ist eine Erweiterung, die lokal auf dem Shopware System installiert wird. Es kann über den Plugin Manager verwaltet und installiert werden. Plugins bieten in der Regel mehr Flexibilität und Kontrolle über die Funktionalität, da sie direkt auf dem Server laufen.

Der Upload des Plugins in unserem Store muss mit den zugehörigen Dateien erfolgen
sprich ob das Plugin eine composer.json oder eine manifest.xml hat.

Dann ist es entweder von Tpy PLUGIN oder von typ APP.

Dies sollte bei uns im Store mit angelegt werden, beziehungsweise im Backend beim upload ausgelesen werden. Danach sollte sich der Install workflow des Plugins unterscheiden von welchem Typ das ist.