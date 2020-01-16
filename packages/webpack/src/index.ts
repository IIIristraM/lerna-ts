import path from 'path';
import webpack, { ProjectConfiguration } from 'webpack';
import glob from 'glob';
import nodeExternals from 'webpack-node-externals';
import ManifestPlugin from 'webpack-manifest-plugin';

const DIST_FOLDER = 'dist';
const SOURCE_FOLDER = 'src';
const MODE = process.env.NODE_ENV || 'development';

export const createWatchIgnore = () => [
    /node_modules/,
    /\.js/,
    /\.json/
]

type Target = webpack.Configuration['target'];

type InitOptions = {
    name: string,
    dll?: boolean,
    context: string,
    entry?: string[],
    hot?: boolean,
    target?: Target
}

const createFileName = (target: Target, dll: boolean) => {
    const parts = ['[name]'];
    if (dll) parts.push('dll');
    if (target === 'web') parts.push('[hash]');

    return [...parts, 'js'].join('.');
}

export const init = ({
    name = '',
    dll = false,
    context = '',
    target = 'web',
    entry,
    hot
}: InitOptions) => {
    const config: ProjectConfiguration = {
        name,
        mode: MODE,
        target,
        context,
        entry: {
            index: entry || (
                dll
                    ? glob.sync(`${context}/${SOURCE_FOLDER}/**/*.[tj]s?(x)`)
                    : [`./${SOURCE_FOLDER}/index`]
            )
        },
        output: {
            filename: createFileName(target, dll),
            path: path.join(context, DIST_FOLDER),
            publicPath: `/static/${name}/`,
            pathinfo: false
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json']
        },
        plugins: [
            new webpack.DefinePlugin({
                NODE_ENV: MODE
            })
        ],
        watchOptions: {
            aggregateTimeout: 500
        },
        externals: []
    }

    if (target === 'web' && MODE === 'production') {
        config.plugins.push(
            new ManifestPlugin({
                filter: (desc) => {
                    return desc.name ? /.js$/.test(desc.name) : false
                },
                generate: (seed, files, entrypoints) => {
                    const manifest: Manifest = {
                        timestamp: Date.now(),
                        resources: files.reduce((manifest, { path }) => {
                            manifest.push(path);
                            return manifest;
                        }, [] as string[])
                    }

                    return manifest;
                }
            })
        )
    }

    if (target === 'node') {
        config.externals.push(
            nodeExternals({
                modulesDir: '../../node_modules'
            })
        )
    }

    if (dll) {
        const libName = `${name}_lib`;
        config.output.library = libName;
        config.output.libraryTarget = 'umd';
        config.output.globalObject = 'this';

        config.plugins.push(...[
            new webpack.DllPlugin({
                context,
                name: libName,
                path: path.join(context, DIST_FOLDER, `[name].manifest.json`),
            })
        ])
    }

    if (hot !== false && MODE === 'development') {
        const hmrPath = `webpack-hot-middleware/client?name=${name}`;

        if (!dll) {
            config.entry["index"].unshift(...[
                hmrPath
            ])
        }

        config.plugins.push(...[
            new webpack.WatchIgnorePlugin(createWatchIgnore()),
            new webpack.HotModuleReplacementPlugin()
        ])
    }

    return config;
}

export const processTypescript = (config: ProjectConfiguration) => {
    config.module = config.module || { rules: [] }
    config.module.rules = config.module.rules || []

    config.module.rules.push({
        test: /[.]tsx?/,
        loader: 'ts-loader',
        exclude: '/node_modules/',
        options: {
            projectReferences: true
        }
    })

    return config;
}

export const addAliases = (config: ProjectConfiguration, dllName: string) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}

    config.resolve.alias = {
        ...config.resolve.alias,
        [`@project/${dllName}`]: path.resolve(config.context, `../${dllName}/${SOURCE_FOLDER}`)
    }
}

export const addDll = (
    config: ProjectConfiguration,
    dllName: string,
    options?: Partial<webpack.DllReferencePlugin.Options>
) => {
    addAliases(config, dllName);

    config.plugins.push(
        new webpack.DllReferencePlugin({
            context: path.resolve(config.context, `../${dllName}`),
            manifest: path.resolve(config.context, `../${dllName}/${DIST_FOLDER}`, 'index.manifest.json'),
            ...options
        })
    )

    return config;
}
