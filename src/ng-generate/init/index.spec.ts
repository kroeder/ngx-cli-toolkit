import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { SchematicInput } from './index';

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
        }
    };

    const angularJsonExpected = {
        ...angularJson,
        projects: {
            ...angularJson.projects

        }
    };

    it('should initialize a schematics project', async () => {
        const runner = new SchematicTestRunner('schematics', collectionPath);
        const tree = Tree.empty();
        tree.create('angular.json', JSON.stringify(angularJson));

        await runner
            .runSchematicAsync(
                'init',
                { project: 'ui' } as SchematicInput,
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
    });
});
