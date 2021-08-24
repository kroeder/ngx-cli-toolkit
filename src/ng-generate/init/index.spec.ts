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
    let options: InitSchematicsProjectOptions;
    const projectUiPackageJsonPath = path.join(angularJson.projects.ui.root, 'package.json');
    const schematicsDirectoryPath = path.join(angularJson.projects.ui.root, 'schematics');

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        tree = Tree.empty();
        tree.create('angular.json', JSON.stringify(angularJson));
        tree.create(projectUiPackageJsonPath, JSON.stringify(packageJson));

        options = {
            path: `${angularJson.projects.ui.root}/subdirectory` as string,
        };
    });

    it('should create migrations.json', async () => {
        await runner.runSchematicAsync('init', options, tree).toPromise();
        const expectedMigrationsJson = {
            $schema: '../../../node_modules/@angular-devkit/schematics/collection-schema.json',
            schematics: {},
        };
        const migrationJson = tree.read(path.join(schematicsDirectoryPath, 'migrations.json'))?.toString('utf8')!;
        expect(JSON.parse(migrationJson)).toMatchObject(expectedMigrationsJson);
    });

    it('should create collection.json', async () => {
        await runner.runSchematicAsync('init', options, tree).toPromise();
        const expectedCollectionJson = {
            $schema: '../../../node_modules/@angular-devkit/schematics/collection-schema.json',
            schematics: {},
        };

        const collectionJson = tree.read(path.join(schematicsDirectoryPath, 'collection.json'))?.toString('utf8')!;
        expect(JSON.parse(collectionJson)).toMatchObject(expectedCollectionJson);
    });

    // todo: enable after the implementation of the builder itself
    // it('should add `build-schematics` builder to angukar.json', () => {
    //     expect(JSON.parse(tree.read('angular.json')?.toString('utf8')!)).toStrictEqual(angularJsonExpected);
    // });

    it('should add schematics entries in package.json', async () => {
        await runner.runSchematicAsync('init', options, tree).toPromise();
        expect(JSON.parse(tree.read(projectUiPackageJsonPath)?.toString('utf8')!)).toStrictEqual(packageJsonExpected);
    });

    it('should init project with the --project flag', async () => {
        let _options = { project: 'ui', path: '/' as string };
        await runner.runSchematicAsync('init', _options, tree).toPromise();
        expect(JSON.parse(tree.read(projectUiPackageJsonPath)?.toString('utf8')!)).toStrictEqual(packageJsonExpected);
    });
});
