# ngx-cli-toolkit - schematics for schematics

This package provides schematics that can setup and generate schematics for your library.
Creating `ng add`, `ng generate`, `ng update` or custom builders for the Angular CLI is 
not easy and often prevents you from solving your actual problems if you are not familiar with the 
bootstrapping process.

This package is currently in development and currently only supports Angular CLI mono repositories (see list of issues).

## Setup
Run `ng add` to add this package as well as useful, schematics related, dependencies that most likely 
be useful for creating your schematics.

### Install

```shell
ng add ngx-cli-toolkit
```

### Bootstrap schematics for an Angular CLI project

```shell
ng generate ngx-cli-toolkit:init
```

### Generating `ng-add` schematics

```shell
ng generate ngx-cli-toolkit:add-schematic
```

### Generating `ng-generate` schematics

```shell
ng generate ngx-cli-toolkit:generate-schematic name-of-your-schematic
```
