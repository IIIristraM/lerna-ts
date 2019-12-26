import path from 'path';
import webpack, { Configuration } from 'webpack';
import glob from 'glob';

type ProjectConfiguration = Configuration & {
    context: string
    entry: {
        index: string[];
        [x: string]: string[];
    }
    output: webpack.Output;
    plugins: webpack.Plugin[]
}

const DIST_FOLDER = 'dist';
const SOURCE_FOLDER = 'src';
const MODE = 'development';

export const createWatchIgnore = () => [
    /dist/,
    /build/,
    /node_modules/,
    /\.js/,
    /\.d\.ts/,
    /\.json/
]

type InitOptions = {
    name: string,
    dll?: boolean,
    context: string,
    entry?: string[]
}

export const init = ({
    name = '',
    dll = false,
    context = '',
    entry
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
            filename: '[name].js',
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

        config.plugins.push(...[
            new webpack.DllPlugin({
                context,
                name: libName,
                path: path.join(context, DIST_FOLDER, `[name].manifest.json`),
            })
        ])
    }

    if (MODE === 'development') {
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
        options: {
            projectReferences: true
        }
    })

    return config;
}

export const addDll = (config: ProjectConfiguration, dllName = '') => {
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    config.plugins = config.plugins || []

    config.resolve.alias = {
        ...config.resolve.alias,
        [`@project/${dllName}`]: path.resolve(config.context, `../${dllName}/${SOURCE_FOLDER}`)
    }

    config.plugins.push(
        new webpack.DllReferencePlugin({
            context: path.resolve(config.context, `../${dllName}`),
            manifest: path.resolve(config.context, `../${dllName}/${DIST_FOLDER}`, 'index.manifest.json'),
        })
    )

    return config;
}
