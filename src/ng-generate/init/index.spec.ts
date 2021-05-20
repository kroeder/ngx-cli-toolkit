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
                            project: 'projects/ui/ng-package.json'
                        },
                        configurations: {
                            production: {
                                tsConfig: 'projects/ui/tsconfig.lib.prod.json'
                            }
                        }
                    }
                }
            },
            defaultProject: 'ui'
        },
    };

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
                            project: 'projects/ui/ng-package.json'
                        },
                        configurations: {
                            production: {
                                tsConfig: 'projects/ui/tsconfig.lib.prod.json'
                            }
                        }
                    },
                    'build-schematics': {
                        builder: 'ng-schematics-toolkit:build-schematics'
                    }
                }
            },
            defaultProject: 'ui'
        }
    };

    it('should initialize a schematics project', async () => {
        const runner = new SchematicTestRunner('schematics', collectionPath);
        const tree = Tree.empty();
        tree.create('angular.json', JSON.stringify(angularJson));

        await runner
            .runSchematicAsync(
                'init',
                { project: 'ui' } as InitSchematicsProjectOptions,
                tree
            )
            .toPromise();

        const schematicsDirectory = path.join(
            angularJson.projects.ui.root,
            'schematics'
        );
        expect(
            tree.exists(path.join(schematicsDirectory, 'migrations.json'))
        ).toBe(true);
        expect(
            tree.exists(path.join(schematicsDirectory, 'collection.json'))
        ).toBe(true);
        expect(
            JSON.parse(tree.read('angular.json')?.toString('utf8')!)
        ).toStrictEqual(angularJsonExpected);
    });
});
