import { s } from '../../utils/stringFormat';
import { AbstractUser } from '../User';

let associationCreate = async (user: AbstractUser, payload: any) => {
    let userEntity = await user.getEntity(['association']);
    
    if (userEntity.association) {
        user.messageLocale(s('association.you_already_a_member', userEntity.association.name));
        return;
    }

    

}