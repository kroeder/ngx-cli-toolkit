# ngx-cli-toolkit - schematics for schematics

This package provides schematics that can setup and generate schematics for your library.
Creating `ng add`, `ng generate`, `ng update` or custom builders for the Angular CLI is 
not easy and often prevents you from solving your actual problems if you are not familiar with the 
bootstrapping process.

**This package is in a very early stage, and most likely has bugs.**

## Support

This package supports all LTS versions of Angular. ([Angular support policy and schedule](https://angular.io/guide/releases#support-policy-and-schedule))

## Schematics

### Install

Run `ng add` to add this package as well as useful, schematics related, dependencies that are
useful for creating schematics.

```shell
ng add ngx-cli-toolkit
```

### Bootstrap schematics project

The `init` schematic tries to discover the location of a package.json based on the directory the schematic was 
executed from. 

It will add the necessary schematic fields to the package.json as well as create json files that manage 
the `ng update` and `ng generate` schematics in your project.

```shell
ng generate ngx-cli-toolkit:init
```

**Example for an Angular library project:**
```shell
ng generate library awesome-library
cd projects/awesome-library
ng generate ngx-cli-toolkit:init
```

### Generating `ng-add` 

This creates a schematic that allows others to add your package using `ng add`.

```shell
ng generate ngx-cli-toolkit:add-schematic
```

### Generating `ng-generate` schematics

This creates a `ng generate` schematic.

```shell
ng generate ngx-cli-toolkit:generate-schematic name-of-your-schematic
```

### Generating `ng-update` schematics

This creates a `ng update` schematic.

```shell
ng generate ngx-cli-toolkit:update-schematic name-of-your-schematic
```
