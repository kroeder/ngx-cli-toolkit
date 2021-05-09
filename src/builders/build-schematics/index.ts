import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { Observable, of } from 'rxjs';
import { json } from '@angular-devkit/core';

interface SchematicsBuilderOptions {
}

export function buildSchematics(
    _options: SchematicsBuilderOptions,
    { logger }: BuilderContext
): Observable<BuilderOutput> {
    logger.info('Noop');
    return of({
        success: true
    });
}

export default createBuilder<json.JsonObject & SchematicsBuilderOptions>(
    buildSchematics
);
