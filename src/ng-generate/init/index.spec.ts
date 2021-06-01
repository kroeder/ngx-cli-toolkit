import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { InitSchematicsProjectOptions } from './index';

const collectionPath = path.join(__dirname, '../../collection.json');

describe('ng-generate', () => {
    const angularJson = {
        version: 1,
        projects: {
            ui: {
                projectType: 'library',
                root: 'projects/ui',
                sourceRoot: 'projects/ui/src',
                architect: {
                    build: {
                        builder: '@angular-devkit/build-angular:ng-packagr',
                        options: {
                            tsConfig: 'projects/ui/tsconfig.lib.json',
                            project: 'projects/ui/ng-package.json',
                        },
                        configurations: {
                            production: {
                                tsConfig: 'projects/ui/tsconfig.lib.prod.json',
                            },
                        },
                    },
                },
            },
            defaultProject: 'ui',
        },
    };

    // @ts-ignore
    const angularJsonExpected = {
        version: 1,
        projects: {
            ui: {
                projectType: 'library',
                root: 'projects/ui',
                sourceRoot: 'projects/ui/src',
                architect: {
                    build: {
                        builder: '@angular-devkit/build-angular:ng-packagr',
                        options: {
                            tsConfig: 'projects/ui/tsconfig.lib.json',
                            project: 'projects/ui/ng-package.json',
                        },
                        configurations: {
                            production: {
                                tsConfig: 'projects/ui/tsconfig.lib.prod.json',
                            },
                        },
                    },
                    'build-schematics': {
                        builder: 'ngx-cli-toolkit:build-schematics',
                    },
                },
            },
            defaultProject: 'ui',
        },
    };

    const packageJson = {
        name: 'ui',
        version: '0.0.1',
        peerDependencies: {
            '@angular/common': '^11.2.13',
            '@angular/core': '^11.2.13',
        },
        dependencies: {
            tslib: '^2.0.0',
        },
    };

    const packageJsonExpected = {
        name: 'ui',
        version: '0.0.1',
        schematics: './schematics/collection.json',
        'ng-update': {
            migrations: './schematics/migrations.json',
            packageGroup: [],
        },
        peerDependencies: {
            '@angular/common': '^11.2.13',
            '@angular/core': '^11.2.13',
        },
        dependencies: {
            tslib: '^2.0.0',
        },
    };

    let tree: Tree;
    let runner: SchematicTestRunner;
    const projectUiPackageJsonPath = path.join(angularJson.projects.ui.root, 'package.json');
    const schematicsDirectoryPath = path.join(angularJson.projects.ui.root, 'schematics');

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        tree = Tree.empty();
        tree.create('angular.json', JSON.stringify(angularJson));
        tree.create(projectUiPackageJsonPath, JSON.stringify(packageJson));

        await runner.runSchematicAsync('init', { project: 'ui' } as InitSchematicsProjectOptions, tree).toPromise();
    });

    it('should create migrations.json', () => {
        const expectedMigrationsJson = {
            $schema: '../../../node_modules/@angular-devkit/schematics/collection-schema.json',
            schematics: {},
        };

        expect(
            JSON.parse(tree.read(path.join(schematicsDirectoryPath, 'migrations.json'))?.toString('utf8')!)
        ).toStrictEqual(expectedMigrationsJson);
    });

    it('should create collection.json', () => {
        const expectedCollectionJson = {
            $schema: '../../../node_modules/@angular-devkit/schematics/collection-schema.json',
            schematics: {},
        };

        expect(
            JSON.parse(tree.read(path.join(schematicsDirectoryPath, 'collection.json'))?.toString('utf8')!)
        ).toStrictEqual(expectedCollectionJson);
    });

    // todo: enable after the implementation of the builder itself
    // it('should add `build-schematics` builder to angukar.json', () => {
    //     expect(JSON.parse(tree.read('angular.json')?.toString('utf8')!)).toStrictEqual(angularJsonExpected);
    // });

    it('should add schematics entries in package.json', () => {
        expect(JSON.parse(tree.read(projectUiPackageJsonPath)?.toString('utf8')!)).toStrictEqual(packageJsonExpected);
    });
});
