import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { PathLike } from 'fs';
import { camelize } from '@angular-devkit/core/src/utils/strings';

const testCollectionPath = path.join(__dirname, '../../collection.json');

describe('ng-update', () => {
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

    const migrationsJson = {
        schematics: {},
    };

    const packageJson = {
        'ng-update': {
            migrations: './schematics/migrations.json',
        },
    };

    const projectPath = angularJson.projects.ui.root;
    const schematicsPath = `projects/ui/schematics`;

    const newSchematicName = 'new-update-schematic';

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', testCollectionPath);
        tree = Tree.empty();
        tree.create(path.join(projectPath, 'package.json'), JSON.stringify(packageJson));
    });

    it('should generate files', async () => {
        tree.create('angular.json', JSON.stringify(angularJson));
        tree.create(path.join(schematicsPath, 'migrations.json'), JSON.stringify(migrationsJson));
        await runner
            .runSchematicAsync(
                'update-schematic',
                {
                    name: newSchematicName,
                    project: 'ui',
                    path: `${schematicsPath}/ng-update` as PathLike,
                },
                tree
            )
            .toPromise();

        const pathToNewSchematic = path.join(schematicsPath, 'ng-update', newSchematicName);

        expect(tree.exists(path.join(pathToNewSchematic, 'index.ts'))).toBe(true);
        expect(tree.exists(path.join(pathToNewSchematic, 'index.spec.ts'))).toBe(true);
    });

    it('should add migrations.json entry', async () => {
        tree.create('angular.json', JSON.stringify(angularJson));
        tree.create(path.join(schematicsPath, 'migrations.json'), JSON.stringify(migrationsJson));
        await runner
            .runSchematicAsync(
                'update-schematic',
                {
                    name: newSchematicName,
                    project: 'ui',
                    path: `${schematicsPath}/ng-update` as PathLike,
                },
                tree
            )
            .toPromise();

        const testCollectionJson = JSON.parse(
            tree.read(path.join(projectPath, packageJson['ng-update'].migrations))?.toString('utf8')!
        );
        const schematicsEntry = testCollectionJson.schematics[newSchematicName];

        expect(schematicsEntry.factory).toStrictEqual(
            `ng-update/${newSchematicName}/index#${camelize(newSchematicName)}`
        );
    });
});
