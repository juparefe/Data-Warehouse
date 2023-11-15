# Data-Warehouse

Este es el repositorio frontend del Data Warehouse, proporciona una interfaz de usuario para interactuar con el backend del sistema. Aplicando diferentes conceptos como:
* Exportar informacion en formato .xlsx
* Gráficas dinamicas basadas en peticiones HTTP
* Importar informacion en formato .csv
* Manejo de roles (Administrador y Cliente) en la aplicacion
* Session storage
* Tokens de sesion
* Visualizacion de datos

## Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- Node.js: [Descargar Node.js](https://nodejs.org/)
- npm (administrador de paquetes de Node.js): Viene incluido con Node.js
- Angular CLI: Instálalo globalmente con `npm install -g @angular/cli`

**Lenguajes utilizados:** TypeScript  
**Frameworks, herramientas o librerias utilizados:** Angular, Bootstrap, Chart.js, html2canvas, ng2-charts, PrimeNG, xlsx

## Scripts Disponibles
* Instalar Dependencias: `npm install`
* Construir la Aplicación: `npm run build`
* Linteo del Código: `npm run lint`
* Iniciar la Aplicación: `npm start`

## Paso a paso para ejecutar el repositorio
Para poder utilizar este repositorio debes seguir estas instrucciones y luego dirigirte al [Repositorio Backend Data Warehouse](https://github.com/juparefe/Data-Warehouse-Server) y seguir las instrucciones para levantar el complemento de la aplicacion
* Clonar el repositorio en el entorno local utilizando el comando 
```
git clone https://github.com/juparefe/Data-Warehouse.git
```
* Abrir la carpeta clonada utilizando algun editor de codigo
* Instala las dependencias:
```
npm install
```
* Ejecuta el siguiente comando para iniciar el servidor:
```
npm start
```
Por defecto la aplicacion se levanta en el puerto [4200](http://localhost:4200/)
