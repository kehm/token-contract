import { Object, Property } from 'fabric-contract-api';
import { TokenStatus } from './types/TokenStatus';

@Object()
export class Token {
    @Property()
    public Id: string;

    @Property()
    public Name: string;

    @Property()
    public Description: string;

    @Property()
    public Status: TokenStatus;

    @Property()
    public Issuer: string;

    @Property()
    public Owner: string;
}
