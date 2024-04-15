import { Activation } from '../artifacts/activation';
import { UnpackEvents } from '../interfaces/events';
import { Session } from '../session';
import { Uri } from '../util/uri';
export declare function installEspIdf(session: Session, events: Partial<UnpackEvents>, targetLocation: Uri): Promise<boolean | undefined>;
export declare function activateEspIdf(session: Session, activation: Activation, targetLocation: Uri): Promise<boolean>;
//# sourceMappingURL=espidf.d.ts.map