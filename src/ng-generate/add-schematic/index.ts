import {
    apply,
    applyTemplates,
    chain,
    mergeWith,
    move,
    noop,
    SchematicsException,
    Tree,
    url,
} from '@angular-devkit/schematics';
import * as path from 'path';
import { getCollectionJsonPath, getParsedPath } from '../../utils/utils';
import { Location } from '@schematics/angular/utility/parse-name';

export interface InitSchematicsProjectOptions {
    path: string;
    saveAs: 'dependencies' | 'devDependencies' | '';
}

export function createAddSchematic(options: InitSchematicsProjectOptions) {
    return async (host: Tree) => {
        const parsedPath = getParsedPath(options.path, 'ng-add');
        const templateSource = apply(url('./files'), [applyTemplates({}), move(parsedPath.path)]);

        return chain([mergeWith(templateSource), updateCollectionJson(host, parsedPath, options)]);
    };
}

function updateCollectionJson(host: Tree, parsedPath: Location, options: InitSchematicsProjectOptions) {
    const collectionPath = getCollectionJsonPath(host, parsedPath);
    const collectionJsonBuffer = host.read(collectionPath);
    if (!collectionJsonBuffer) {
        throw new SchematicsException(`Could not read file '${collectionPath}'`);
    }

    const collectionJson = JSON.parse(collectionJsonBuffer.toString('utf8'));
    const relativePathToSchematic = path
        .relative(
            path.join(process.cwd(), path.dirname(collectionPath)),
            path.join(process.cwd(), parsedPath.path, 'ng-add', 'index')
        )
        .replace(/\\/g, '/');

    const updatedCollectionJson = {
        ...collectionJson,
        schematics: {
            'ng-add': {
                save: options.saveAs,
                description: 'Bootstrap package',
                factory: `${relativePathToSchematic}#ngAdd`,
            },
            ...collectionJson.schematics,
        },
    };
    host.overwrite(collectionPath, JSON.stringify(updatedCollectionJson, null, 2));

    return noop();
}
