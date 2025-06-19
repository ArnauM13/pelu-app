# PeluApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.20.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Stack front

| Paquet                | Versió Recomanada | Notes                                                                    |
| --------------------- | ----------------- | ------------------------------------------------------------------------ |
| `@angular/core`       | `^18.2.0`         | El nucli d'Angular 18 estable                                            |
| `@angular/cli`        | `^18.2.0`         | Per generar, servir i compilar                                           |
| `@angular/animations` | `^18.2.0`         | Necessari per components com `Dialog`, `Toast`, etc.                     |
| `primeng`             | `18`              | Compatible amb Angular 18                                                |
| `primeicons`          | `^6.1.1`          | Icons per botons, menús, etc.                                            |
| `primeflex`           | `^3.3.1`          | Utilitats CSS per layout i estil ràpid                                   |
| `rxjs`                | `^7.8.1`          | Ja ve amb Angular, però assegura’t que és una versió 7.x estable         |
| `typescript`          | `~5.4.5`          | Compatible amb Angular 18 (Angular 18 no és 100% compatible amb TS 5.5+) |

## Stack back

| Paquet        | Versió Recomanada    | Notes                                      |
| ------------- | -------------------- | ------------------------------------------ |
| `node`        | `18.x` LTS           | Estable, compatible amb la majoria de dep. |
| `express`     | `^4.18.2`            | Framework web lleuger i robust             |
| `cors`        | `^2.8.5`             | Per habilitar peticions cross-origin       |
| `body-parser` | `^1.20.2`            | Per parsejar el `req.body` en JSON         |
| `mongoose`    | `^7.6.1` (opcional)  | Si treballes amb MongoDB                   |
| `typeorm`     | `^0.3.17` (opcional) | Si fas servir Postgres, MySQL, etc.        |

## Stack test

| Eina       | Ús                                        |
| ---------- | ----------------------------------------- |
| `Jest`     | Testing d'unitat (millor que Karma)       |
| `Cypress`  | Testing e2e si vols testar fluxos sencers |
| `ESLint`   | Bona pràctica per mantenir el codi net    |
| `Prettier` | Formatador automàtic                      |
