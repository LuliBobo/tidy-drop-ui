// Importing a non-existent module
import { format } from './non-existent-module';

const formattedDate = format(new Date(), 'yyyy-MM-dd');
console.log(formattedDate);