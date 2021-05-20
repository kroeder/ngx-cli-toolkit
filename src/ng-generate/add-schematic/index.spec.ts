import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { PathLike } from 'fs';

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

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', testCollectionPath);
        tree = Tree.empty();
        tree.create(path.join(projectPath, 'package.json'), JSON.stringify(packageJson));
    });

    it('should generate files', async () => {
        tree.create('angular.json', JSON.stringify(angularJson));
        tree.create(path.join(schematicsPath, 'collection.json'), JSON.stringify(collectionJson));
        await runner
            .runSchematicAsync(
                'add-schematic',
                {
                    project: 'ui',
                    saveAs: 'dependencies',
                    path: schematicsPath as PathLike,
                },
                tree
            )
            .toPromise();

        expect(tree.exists(path.join(schematicsPath, 'ng-add', 'index.ts'))).toBe(true);
        expect(tree.exists(path.join(schematicsPath, 'ng-add', 'index.spec.ts'))).toBe(true);
    });

    it('should add collection.json entry', async () => {
        tree.create('angular.json', JSON.stringify(angularJson));
        tree.create(path.join(schematicsPath, 'collection.json'), JSON.stringify(collectionJson));
        await runner
            .runSchematicAsync(
                'add-schematic',
                {
                    project: 'ui',
                    saveAs: 'dependencies',
                    path: schematicsPath as PathLike,
                },
                tree
            )
            .toPromise();

        const testCollectionJson = JSON.parse(
            tree.read(path.join(projectPath, packageJson.schematics))?.toString('utf8')!
        );
        const ngAddEntry = testCollectionJson.schematics['ng-add'];

        expect(ngAddEntry.save).toStrictEqual('dependencies');
        expect(ngAddEntry.factory).toStrictEqual('ng-add/index#ngAdd');
    });
});
