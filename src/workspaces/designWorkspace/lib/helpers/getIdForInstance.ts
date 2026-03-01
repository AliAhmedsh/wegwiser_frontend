import {v4 as uuid} from 'uuid';
//get id for instance with incstane name
export const getIdForInstance = (instanceTypeName: string): string => {
    return `${instanceTypeName}-${uuid()}`;
};