import {
    Context, Contract, Info, Returns, Transaction,
} from 'fabric-contract-api';
import { Token } from './Token';
import { TokenStatus } from './types/TokenStatus';

@Info({ title: 'TokenContract', description: 'Smart contract for creating and transferring tokens' })
export class TokenContract extends Contract {
    @Transaction()
    @Returns('string')
    public async Create(
        ctx: Context,
        name: string,
        description: string,
        issuer: string,
    ): Promise<string> {
        console.info('Invoking chaincode function \'Create\'');
        const tokenJSON = await ctx.stub.getState(name + issuer);
        if (tokenJSON && tokenJSON.length > 0) {
            throw new Error('The token already exists');
        }
        const token: Token = {
            Id: name + issuer,
            Name: name,
            Description: description,
            Status: TokenStatus.TRADING,
            Issuer: issuer,
            Owner: issuer,
        };
        await ctx.stub.putState(token.Id, Buffer.from(JSON.stringify(token)));
        console.info('Successfully created new token');
        return JSON.stringify(token);
    }

    @Transaction()
    @Returns('string')
    public async Transfer(
        ctx: Context,
        id: string,
        newOwner: string,
    ): Promise<void> {
        console.info('Invoking chaincode function \'Transfer\'');
        const tokenJSON = await ctx.stub.getState(id);
        if (!tokenJSON || tokenJSON.length === 0) {
            throw new Error('The token does not exist');
        }
        const token: Token = JSON.parse(tokenJSON.toString());
        token.Owner = newOwner;
        await ctx.stub.putState(token.Id, Buffer.from(JSON.stringify(token)));
        console.info('Successfully transferred token');
    }

    @Transaction()
    @Returns('string')
    public async Withdraw(
        ctx: Context,
        id: string,
    ): Promise<void> {
        console.info('Invoking chaincode function \'Withdraw\'');
        const tokenJSON = await ctx.stub.getState(id);
        if (!tokenJSON || tokenJSON.length === 0) {
            throw new Error('The token does not exist');
        }
        const token: Token = JSON.parse(tokenJSON.toString());
        token.Status = TokenStatus.WITHDRAWN;
        await ctx.stub.putState(token.Id, Buffer.from(JSON.stringify(token)));
        console.info('Successfully withdrew token');
    }

    @Transaction(false)
    @Returns('string')
    public async GetToken(
        ctx: Context,
        id: string,
    ): Promise<string> {
        console.info('Invoking chaincode function \'GetToken\'');
        const tokenJSON = await ctx.stub.getState(id);
        if (!tokenJSON || tokenJSON.length === 0) {
            throw new Error('The token does not exist');
        }
        console.info('Successfully retrieved token');
        return tokenJSON.toString();
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllTokens(
        ctx: Context,
    ): Promise<string> {
        console.info('Invoking chaincode function \'GetAllTokens\'');
        const tokens: Array<Token | string> = [];
        const stateIterator = await ctx.stub.getStateByRange('', '');
        let result = await stateIterator.next();
        while (!result.done) {
            const tokenJSON = Buffer.from(result.value.value.toString()).toString('utf8');
            let token: Token | string;
            try {
                token = JSON.parse(tokenJSON);
            } catch (err: unknown) {
                console.info(err);
                token = tokenJSON;
            }
            tokens.push(token);
            result = await stateIterator.next();
        }
        console.info('Successfully retrieved list of tokens');
        return JSON.stringify(tokens);
    }
}
