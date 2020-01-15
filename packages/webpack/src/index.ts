import path from 'path';
import webpack, { ProjectConfiguration } from 'webpack';
import glob from 'glob';

const DIST_FOLDER = 'dist';
const SOURCE_FOLDER = 'src';
const MODE = 'development';

export const createWatchIgnore = () => [
    /node_modules/,
    /\.js/,
    /\.json/
]

type InitOptions = {
    name: string,
    dll?: boolean,
    context: string,
    entry?: string[],
    hot?: boolean
}

export const init = ({
    name = '',
    dll = false,
    context = '',
    entry,
    hot
}: InitOptions) => {
    const config: ProjectConfiguration = {
        name,
        mode: MODE,
        context,
        entry: {
            index: entry || (
                dll
                    ? glob.sync(`${context}/${SOURCE_FOLDER}/**/*.[tj]s?(x)`)
                    : [`./${SOURCE_FOLDER}/index`]
            )
        },
        output: {
            filename: dll ? '[name].bundle.dll.js' : '[name].bundle.js',
            path: path.join(context, DIST_FOLDER),
            publicPath: `/static/${name}/`
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json']
        },
        plugins: [],
        watchOptions: {
            aggregateTimeout: 500
        }
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
    config.plugins = config.plugins || []

    config.plugins.push(
        new webpack.DllReferencePlugin({
            context: path.resolve(config.context, `../${dllName}`),
            manifest: path.resolve(config.context, `../${dllName}/${DIST_FOLDER}`, 'index.manifest.json'),
            ...options
        })
    )

    return config;
}
