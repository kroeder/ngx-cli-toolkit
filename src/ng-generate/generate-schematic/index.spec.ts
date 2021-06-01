import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { camelize } from '@angular-devkit/core/src/utils/strings';
import { GenerateSchematicOptions } from './index';

const testCollectionPath = path.join(__dirname, '../../collection.json');

describe('ng-generate', () => {
    let tree: Tree;
    let runner: SchematicTestRunner;

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

    const collectionJson = {
        schematics: {},
    };

    const packageJson = {
        schematics: './schematics/collection.json',
    };

    const projectPath = 'projects/ui';
    const schematicsPath = `${projectPath}/schematics`;

    const newSchematicName = 'new-generate-schematic';

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', testCollectionPath);
        tree = Tree.empty();
        tree.create(path.join(projectPath, 'package.json'), JSON.stringify(packageJson));
    });

    it('should generate files', async () => {
        tree.create('angular.json', JSON.stringify(angularJson));
        tree.create(path.join(schematicsPath, 'collection.json'), JSON.stringify(collectionJson));
        const options: GenerateSchematicOptions = {
            name: newSchematicName,
            description: 'A description',
            path: `${schematicsPath}/ng-generate` as string,
        };
        await runner.runSchematicAsync('generate-schematic', options, tree).toPromise();

        const pathToNewSchematic = path.join(schematicsPath, 'ng-generate', newSchematicName);

        expect(tree.exists(path.join(pathToNewSchematic, 'index.ts'))).toBe(true);
        expect(tree.exists(path.join(pathToNewSchematic, 'index.spec.ts'))).toBe(true);
    });

    it('should add collection.json entry', async () => {
        tree.create('angular.json', JSON.stringify(angularJson));
        tree.create(path.join(schematicsPath, 'collection.json'), JSON.stringify(collectionJson));
        const options: GenerateSchematicOptions = {
            name: newSchematicName,
            description: 'A description',
            path: `${schematicsPath}/ng-generate` as string,
        };
        await runner.runSchematicAsync('generate-schematic', options, tree).toPromise();

        const testCollectionJson = JSON.parse(
            tree.read(path.join(projectPath, packageJson.schematics))?.toString('utf8')!
        );
        const schematicsEntry = testCollectionJson.schematics[newSchematicName];

        expect(schematicsEntry.factory).toStrictEqual(
            `ng-generate/${newSchematicName}/index#${camelize(newSchematicName)}`
        );
    });
});
