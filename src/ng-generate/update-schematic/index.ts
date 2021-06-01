import { apply, applyTemplates, chain, mergeWith, move, noop, Tree, url } from '@angular-devkit/schematics';
import * as path from 'path';
import { camelize, dasherize } from '@angular-devkit/core/src/utils/strings';
import { strings } from '@angular-devkit/core';
import { getMigrationsJsonPath, getParsedPath, readJson } from '../../utils/utils';
import { Location } from '@schematics/angular/utility/parse-name';

export interface UpdateSchematicOptions {
    name: string;
    path: string;
    description: string;
    version: string;
}

export function createUpdateSchematic(options: UpdateSchematicOptions) {
    return async (host: Tree) => {
        const parsedPath = getParsedPath(options.path, options.name);

        const generatedSchematicDir = path.join(__dirname, parsedPath.path, dasherize(options.name));
        const migrationsJson = path.join(__dirname, getMigrationsJsonPath(host, parsedPath));
        const relativePathToMigrationsJson = path.relative(generatedSchematicDir, migrationsJson);

        const templateSource = apply(url('./files'), [
            applyTemplates({
                name: options.name,
                migrationsJsonPath: relativePathToMigrationsJson.replace(/\\/g, '/'),
                camelize: strings.camelize,
                classify: strings.classify,
                dasherize: strings.dasherize,
            }),
            move(parsedPath.path),
        ]);

        return chain([mergeWith(templateSource), updateMigrationsJson(host, parsedPath, options)]);
    };
}

function updateMigrationsJson(host: Tree, parsedPath: Location, options: UpdateSchematicOptions) {
    const migrationsJsonPath = getMigrationsJsonPath(host, parsedPath);
    const migrationsJson = readJson(host, migrationsJsonPath);
    const schematicName = options.name;

    const relativePathToSchematic = path
        .relative(
            path.join(process.cwd(), path.dirname(migrationsJsonPath)),
            path.join(process.cwd(), parsedPath.path, schematicName, 'index')
        )
        .replace(/\\/g, '/');

    const updatedMigrationsJson = {
        ...migrationsJson,
        schematics: {
            ...migrationsJson.schematics,
            [dasherize(schematicName)]: {
                description: options.description,
                factory: `${relativePathToSchematic}#${camelize(options.name)}`,
                schema: `${relativePathToSchematic.replace('index', 'schema.json')}`,
                version: options.version,
            },
        },
    };
    host.overwrite(migrationsJsonPath, JSON.stringify(updatedMigrationsJson, null, 2));

    return noop();
}
