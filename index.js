'use strict';

const path = require('path');
const globby = require('globby');
const resolve = require('resolve');
const { cosmiconfigSync } = require('cosmiconfig');
const get = require('dlv');
const log = require('debug')('eslint-plugin-import:resolver:preconstruct');

const logEntries = log.extend('entries');
const logSkipped = log.extend('skipped');

exports.interfaceVersion = 2;
exports.resolve = importResolverPreconstruct;

const ENTRYPOINTS = new Map();

function importResolverPreconstruct(identifier /*, file , config */) {
    let result = { found: false };

    // always skip relative paths
    if (identifier[0] === '.') {
        logSkipped('%j', identifier);
        return result;
    }

    try {
        if (ENTRYPOINTS.size === 0) {
            warmupCache(ENTRYPOINTS);
            logEntries('ENTRYPOINTS %O', ENTRYPOINTS);
        }

        if (ENTRYPOINTS.has(identifier)) {
            result = { found: true, path: ENTRYPOINTS.get(identifier) };
            log('Resolved %j to %s', identifier, result.path);
        } else {
            logSkipped('%j', identifier);
        }
    } catch (err) {
        log('threw error', err);
    }

    return result;
}

function getManifestPaths({ config, filepath }) {
    const rootDir = path.dirname(filepath);
    const patterns = config.map(pattern => path.join(pattern, 'package.json'));
    return globby
        .sync(patterns, {
            cwd: rootDir,
            absolute: true,
            expandDirectories: false,
            followSymlinkedDirectories: false,
        })
        .sort();
}

function getConfigEntrypoints(json) {
    return get(json, 'preconstruct.entrypoints', ['.']);
}

function getConfigSource(json) {
    return get(json, 'preconstruct.source', 'src/index');
}

function getResolvedEntry(directory, source) {
    return resolve.sync(path.resolve(directory, source), {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    });
}

const explorer = cosmiconfigSync('preconstruct', {
    searchPlaces: ['package.json'],
    packageProp: 'preconstruct.packages',
});

function warmupCache(cache) {
    logEntries('seeding local entrypoint cache');

    const packageGlobs = explorer.search();
    logEntries('packageGlobs %O', packageGlobs);

    if (packageGlobs) {
        const manifestPaths = getManifestPaths(packageGlobs);
        logEntries('manifestPaths %O', manifestPaths);

        for (const manifestPath of manifestPaths) {
            const pkgJson = require(manifestPath);
            const pkgName = pkgJson.name;
            const pkgRoot = path.dirname(manifestPath);

            for (const entrypoint of getConfigEntrypoints(pkgJson)) {
                const identifier = path.join(pkgName, entrypoint);
                const directory = path.join(pkgRoot, entrypoint);
                // likely the root pkg, ok because the require cache is hot
                const json = require(path.join(directory, 'package.json'));
                const source = getConfigSource(json);
                const resolvedEntry = getResolvedEntry(directory, source);

                cache.set(identifier, resolvedEntry);
            }
        }
    }
}
