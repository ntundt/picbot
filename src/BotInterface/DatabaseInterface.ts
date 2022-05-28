import { createConnection, Connection, EntityManager, Repository } from 'typeorm';
import Account from './DatabaseEntities/Account';
import Permission from './DatabaseEntities/Permission';
import Subscription from './DatabaseEntities/Subscription';
import Appeal from './DatabaseEntities/Appeal';
import { VKUser } from './User';
import Contract from './DatabaseEntities/Contract';

export default class DatabaseInterface {

    private static connection: Connection;
    
    public static entityManager: EntityManager;

    public static accountRepository: Repository<Account>;
    public static permissionRepository: Repository<Permission>;
    public static subscriptionRepository: Repository<Subscription>;
    public static appealRepository: Repository<Appeal>;
    public static contractRepository: Repository<Contract>;

    public static async init(): Promise<void> {
        try {
            const prod = process.env.PROD ? true : false;

            this.connection = await createConnection();
            this.entityManager = this.connection.createEntityManager();

            this.accountRepository = this.entityManager.getRepository(Account);
            this.permissionRepository = this.entityManager.getRepository(Permission);
            this.subscriptionRepository = this.entityManager.getRepository(Subscription);
            this.appealRepository = this.entityManager.getRepository(Appeal);
            this.contractRepository = this.entityManager.getRepository(Contract);

            this.subscriptionRepository.save([
                { id: 1, name: 'botStartup' },
                { id: 3, name: 'userMessage' },
                { id: 4, name: 'errors' }
            ])
        } catch (e) { (new VKUser(165054978)).message(e.message + '\n' + e.stack); }
    }

}
