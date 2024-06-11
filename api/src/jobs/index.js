import { PrismaAdapter } from './PrismaAdapter'
import { ProductBackorderJob } from './ProductBackorderJob'
import { RedwoodJob } from './RedwoodJob'

RedwoodJob.config({ adapter: new PrismaAdapter() })

export const jobs = {
  productBackorder: new ProductBackorderJob(),
}
