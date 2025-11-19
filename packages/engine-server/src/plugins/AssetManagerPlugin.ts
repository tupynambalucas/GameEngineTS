import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { resolve, relative, extname, parse, dirname } from 'path'; // 1. Importe 'dirname'
import { glob } from 'glob'; // Usará a nova versão v10+
import { sync as md5File } from 'md5-file';
import { promises as fs } from 'fs';

// --- Tipos de Estrutura ---
interface AssetManifestEntry {
  hash: string;
  url: string;
  publicId: string;
}
type AssetManifest = Record<string, AssetManifestEntry>;
type AssetTree = Record<string, any>;

// 2. Lógica para encontrar o caminho do pacote (MUITO MAIS ROBUSTO)
const findAssetsPackagePath = () => {
  try {
    // require.resolve retorna o caminho para o package.json do pacote de assets
    const packageJsonPath = require.resolve('@tupynambagame/engine-assets/package.json');
    // dirname() nos dá o diretório raiz desse pacote
    return dirname(packageJsonPath);
  } catch (e) {
    throw new Error('Não foi possível encontrar o pacote "@tupynambagame/engine-assets". Você instalou as dependências (npm install)?');
  }
};

const ASSETS_PACKAGE_PATH = findAssetsPackagePath();
const LOCAL_ASSETS_PATH = resolve(ASSETS_PACKAGE_PATH, 'local');
const MANIFEST_FILE_PATH = resolve(ASSETS_PACKAGE_PATH, 'asset-manifest.json');
const OUTPUT_TS_FILE_PATH = resolve(ASSETS_PACKAGE_PATH, 'cloud.assets.ts');

const AssetManagerPlugin = async (server: FastifyInstance) => {
  server.log.info('Iniciando o Asset Manager Plugin...');

  // --- 1. Configurar Cloudinary ---
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = server.config;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    server.log.warn('Cloudinary env vars not set. Pulando sincronização de assets.');
    return;
  }
  
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  // --- 2. Carregar Manifesto Antigo ---
  let oldManifest: AssetManifest = {};
  try {
    const manifestData = await fs.readFile(MANIFEST_FILE_PATH, 'utf-8');
    oldManifest = JSON.parse(manifestData);
    server.log.info('Carregado manifest de assets existente.');
  } catch (err) {
    server.log.warn('Nenhum manifest de assets encontrado. Criando um novo.');
  }

  // --- 3. Escanear Arquivos Locais (SINTAXE CORRIGIDA) ---
  const localFiles = await glob(`${LOCAL_ASSETS_PATH}/**/*`, { 
    nodir: true, // 'nodir' agora funciona
    ignore: ['**/*.blend*', '**/*.blend1'],
  });
  
  const newManifest: AssetManifest = {};
  let filesChanged = 0;

  // --- 4. Sincronizar Arquivos ---
  for (const localFile of localFiles) {
    const assetKey = relative(LOCAL_ASSETS_PATH, localFile).replace(/\\/g, '/');
    const currentHash = md5File(localFile);
    const oldEntry = oldManifest[assetKey];

    if (!oldEntry || oldEntry.hash !== currentHash) {
      filesChanged++;
      server.log.warn(`[Asset Sync] Mudança detectada: ${assetKey}. Fazendo upload...`);

      try {
        const fileExt = extname(localFile);
        const publicId = assetKey.replace(fileExt, '');
        
        let resourceType: 'raw' | 'image' | 'video' = 'image';
        if (['.glb', '.mp3'].includes(fileExt)) {
          resourceType = 'raw';
        } else if (['.mp4', '.mov'].includes(fileExt)) {
          resourceType = 'video';
        }

        const result: UploadApiResponse = await cloudinary.uploader.upload(localFile, {
          public_id: publicId,
          resource_type: resourceType,
          overwrite: true,
        });

        newManifest[assetKey] = {
          hash: currentHash,
          url: result.secure_url,
          publicId: result.public_id,
        };
        
      } catch (err: any) {
        server.log.error(err, `[Asset Sync] Falha no upload de ${assetKey}`);
      }
    } else {
      newManifest[assetKey] = oldEntry;
    }
  }
  
  if (filesChanged > 0) {
    server.log.info(`[Asset Sync] ${filesChanged} assets atualizados.`)
  } else {
    server.log.info('[Asset Sync] Nenhum asset foi alterado.')
  }

  // --- 5. Salvar Novo Manifesto ---
  await fs.writeFile(MANIFEST_FILE_PATH, JSON.stringify(newManifest, null, 2));

  // --- 6. Gerar o Arquivo cloud.assets.ts ---
  const assetTree: AssetTree = {};
  for (const [key, entry] of Object.entries(newManifest)) {
    const parts = key.split('/');
    const fileName = parts.pop()!;
    const assetName = parse(fileName).name; 

    let currentLevel = assetTree;
    for (const part of parts) {
      currentLevel[part] = currentLevel[part] || {};
      currentLevel = currentLevel[part];
    }
    currentLevel[assetName] = entry.url;
  }
  
  const tsFileContent = `/* eslint-disable */\n// Este arquivo é gerado automaticamente. Não edite.\n\nexport const cloudAssets = ${JSON.stringify(assetTree, null, 2)} as const;\n`;
  await fs.writeFile(OUTPUT_TS_FILE_PATH, tsFileContent);
  server.log.info(`Arquivo de assets gerado: ${OUTPUT_TS_FILE_PATH}`);

  server.log.info('Asset Manager Plugin concluído.');
};

export default fp(AssetManagerPlugin);