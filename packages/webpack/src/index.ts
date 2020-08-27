import path from 'path';
import webpack, { ProjectConfiguration } from 'webpack';
import glob from 'glob';
import nodeExternals from 'webpack-node-externals';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { Program } from 'typescript';

import { transform, StatsPlugin } from '@project/tools/code-splitting/webpack';

const DIST_FOLDER = 'dist';
const SOURCE_FOLDER = 'src';
const MODE = process.env.NODE_ENV || 'development';

export const createWatchIgnore = () => [/node_modules/, /\.js/, /\.json/];

type Target = webpack.Configuration['target'];

type InitOptions = {
    name: string;
    dll?: boolean;
    context: string;
    entry?: string[];
    hot?: boolean;
    target?: Target;
};

const createFileName = (config: ProjectConfiguration, ext: string) => {
    const {
        target,
        output: { library },
        mode,
    } = config;

    const parts = ['[name]'];
    if (!!library) parts.push('dll');
    if (target === 'web' && mode === 'production') parts.push('[hash]');

    return [...parts, ext].join('.');
};

export const init = ({ name = '', dll = false, context = '', target = 'web', entry, hot }: InitOptions) => {
    const config: ProjectConfiguration = {
        name,
        mode: MODE,
        target,
        context,
        entry: {
            index:
                entry || (dll ? glob.sync(`${context}/${SOURCE_FOLDER}/**/*.[tj]s?(x)`) : [`./${SOURCE_FOLDER}/index`]),
        },
        output: {
            path: path.join(context, DIST_FOLDER),
            publicPath: `/static/${name}/`,
            pathinfo: false,
        },
        resolve: {
            alias:
                MODE === 'development'
                    ? {
                          'react-dom': '@hot-loader/react-dom',
                      }
                    : {},
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
        plugins: [
            new webpack.DefinePlugin({
                NODE_ENV: MODE,
            }),
        ],
        watchOptions: {
            aggregateTimeout: 500,
        },
        externals: [],
        optimization: {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendors: false,
                },
            },
        },
    };

    if (target === 'web' && MODE === 'production') {
        config.plugins.push(new StatsPlugin());

        config.optimization = {
            ...config.optimization,
            minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        };
    }

    if (target === 'node') {
        config.optimization = {
            ...config.optimization,
            minimize: false,
        };

        config.externals.push(
            nodeExternals({
                modulesDir: '../../node_modules',
            }),
        );
    }

    if (dll) {
        const libName = `${name}_lib`;
        config.output.library = libName;
        config.output.libraryTarget = 'umd';
        config.output.globalObject = 'this';

        config.plugins.push(
            ...[
                new webpack.DllPlugin({
                    context,
                    name: libName,
                    path: path.join(context, DIST_FOLDER, `[name].manifest.json`),
                }),
            ],
        );
    }

    if (hot !== false && MODE === 'development') {
        const hmrPath = `webpack-hot-middleware/client?name=${name}`;

        if (!dll) {
            config.entry['index'].unshift(...[hmrPath]);
        }

        config.plugins.push(
            ...[new webpack.WatchIgnorePlugin(createWatchIgnore()), new webpack.HotModuleReplacementPlugin()],
        );
    }

    config.output.filename = createFileName(config, 'js');
    config.output.chunkFilename = createFileName(config, 'js');

    return config;
};

export const processTypescript = (config: ProjectConfiguration) => {
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];

    config.module.rules.push({
        test: /[.]tsx?/,
        loader: 'ts-loader',
        exclude: '/node_modules/',
        options: {
            projectReferences: true,
            compilerOptions: {
                module: 'ESNext',
            },
            getCustomTransformers: (program: Program) => ({
                before: [transform],
            }),
        },
    });

    return config;
};

export const processStyles = (config: ProjectConfiguration) => {
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];

    // const { target, output: { library } } = config;
    const loaders: webpack.RuleSetUseItem[] = [];
    if (config.target === 'web') {
        loaders.push({
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: config.mode === 'development',
                reloadAll: true,
            },
        });

        config.plugins.push(
            new MiniCssExtractPlugin({
                filename: createFileName(config, 'css'),
                esModule: true,
            }),
        );
    }

    config.module.rules.push({
        test: /\.css$/,
        use: [
            ...loaders,
            {
                loader: 'css-loader',
                options: {
                    modules: {
                        context: __dirname, // required for identical hashes
                        localIdentName: config.mode === 'development' ? '[local]__[hash:base64]' : '[hash:base64]',
                    },
                    onlyLocals: config.target === 'node',
                },
            },
        ],
    });

    return config;
};

export const addAliases = (config: ProjectConfiguration, pkg: string) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    config.resolve.alias = {
        ...config.resolve.alias,
        [`@project/${pkg}`]: path.resolve(config.context, `../${pkg}/${SOURCE_FOLDER}`),
    };
};

export const addDll = (
    config: ProjectConfiguration,
    dllName: string,
    options?: Partial<webpack.DllReferencePlugin.Options>,
) => {
    addAliases(config, dllName);

    config.plugins.push(
        new webpack.DllReferencePlugin({
            context: path.resolve(config.context, `../${dllName}`),
            manifest: path.resolve(config.context, `../${dllName}/${DIST_FOLDER}`, 'index.manifest.json'),
            ...options,
        }),
    );

    return config;
};
