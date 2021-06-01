import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('ng-add', () => {
    it('should add devDependencies', async () => {
        const angularJson = {
            dependencies: {
                '@angular/core': '~11.2.11',
            },
            devDependencies: {},
        };

        const angularJsonExpected = {
            dependencies: {
                '@angular/core': '~11.2.11',
            },
            devDependencies: {
                '@angular-devkit/architect': '~0.1102.11',
                '@angular-devkit/core': '~11.2.11',
                '@angular-devkit/schematics': '~11.2.11',
                '@schematics/angular': '~11.2.11',
            },
        };

        const runner = new SchematicTestRunner('schematics', collectionPath);
        const tree = Tree.empty();
        tree.create('package.json', JSON.stringify(angularJson));

        await runner.runSchematicAsync('ng-add', {}, tree).toPromise();

        expect(JSON.parse(tree.read('package.json')!.toString())).toEqual(angularJsonExpected);
    });
});
