# I've Work - Guía de Configuración e Instalación

Este documento detalla los pasos necesarios para instalar dependencias, configurar el entorno y desplegar la aplicación en Web, Android e iOS.

## 📋 Requisitos Previos

El proyecto ha sido probado y validado con las siguientes versiones:

* **Node.js:** 24.0.0
* **NPM:** 11.3.0
* **Yarn:** 1.22.22

## 🚀 Instalación de Dependencias

Es necesario instalar las dependencias tanto en la raíz del proyecto como en el subdirectorio de la aplicación.

1.  **Instalar en la raíz:**
    ```bash
    yarn install
    ```

2.  **Instalar en MyFliwer:**
    ```bash
    cd MyFliwer
    yarn install
    ```
    > **Nota:** Si durante este paso aparece un error relacionado con `Patch file`, puedes ignorarlo. Las librerías se instalan correctamente a pesar de esta advertencia.

---

## 🌐 Entorno Web

Para ejecutar la versión web, es necesario realizar una compilación inicial de los ficheros estáticos.

### 1. Compilación inicial
Ejecuta el script de construcción correspondiente a tu sistema operativo desde la raíz del proyecto:

* **Windows:**
    ```bash
    npm run-script build-web-windows
    ```
* **Linux / macOS:**
    ```bash
    npm run-script build-web-linux
    ```

### 2. Ejecución
Una vez compilado, inicia el servidor de desarrollo desde la raíz:

```bash
npm start
```
La aplicación estará accesible en: http://localhost:8082
## 🤖 Entorno Android

Para compilar en Android es necesario configurar las claves de firma (Keystores) y la ruta del SDK local.

### 1. Generación de Keystores
Debes generar dos archivos `.keystore` en la ruta `MyFliwer/android/app`. Abre una terminal en esa carpeta y ejecuta los siguientes comandos:

#### A. Keystore de Debug
```bash
keytool -genkey -v -keystore taskium-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
* **Contraseña:** `inolve2011`
* **Resto de preguntas:** Puedes saltarlas (pulsando Enter).
* **Confirmación final:** Escribe `y` (o `si`) cuando pregunte si es correcto.

#### B. Keystore de Release
```bash
keytool -genkey -v -keystore taskium.keystore -alias taskiumkeystore -keyalg RSA -keysize 2048 -validity 10000
```
* **Contraseña:** `fliwer2013`
* **Resto de preguntas:** Puedes saltarlas.

### 2. Configuración local (local.properties)
Crea un archivo llamado `local.properties` en la ruta `MyFliwer/android/`. Este archivo debe indicar la ruta a tu SDK de Android.

**Ejemplo de contenido (Windows):**
```
sdk.dir = C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
```
*(Asegúrate de que la ruta sea correcta y de usar doble barra invertida `\\` en Windows)*.

### 3. Compilación y Ejecución
Vuelve a la raíz del proyecto para ejecutar los scripts de Android:

* **Modo Debug (Desarrollo):**
```bash
npm run-script android
```
* **Modo Release (Producción):**
```bash
npm run-script build-android
```

---

## 🍎 Entorno iOS

Para desplegar la aplicación en dispositivos iOS o simuladores (requiere macOS):

1.  Accede a la carpeta de iOS:
```bash
cd MyFliwer/ios
```
2.  Instala las dependencias nativas (CocoaPods):
```bash
pod install
```
3.  Abre el espacio de trabajo generado en Xcode (`.xcworkspace`) y compila el proyecto seleccionando el target deseado (**Debug** o **Release**).