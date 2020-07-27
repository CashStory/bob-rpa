import { toucan } from './toucan';
import { filestash } from './filestash';
import { jupyter } from './jupyter';
import { wekan } from './wekan';
import { BobRpa } from './base';

type RPAMode = 'toucan' | 'filestash' | 'jupyter' | 'wekan';

export const load = (mode: RPAMode): BobRpa => {
    console.log('load', mode);
    
    if (mode === 'toucan') {
    return toucan();
    }
    if (mode === 'filestash') {
    return filestash();
    }
    if (mode === 'jupyter') {
    return jupyter();
    }
    if (mode === 'wekan') {
    return wekan();
    }
    throw new Error("Unknow mode");
}
