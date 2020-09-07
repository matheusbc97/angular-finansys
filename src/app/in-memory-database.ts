import { InMemoryDbService } from 'angular-in-memory-web-api'

import {Category} from './pages/categories/shared/category.model'
import {Entry} from './pages/entries/shared/entry.model'

export class InMemoryDatabase implements InMemoryDbService{
  createDb(){
    const categories: Category[] = [
      {id:1, name: "moradia", description: 'Pagamentos de conta da casa'},
      {id:2, name: "moradia2", description: 'Pagamentos de conta da casa2'},
      {id:3, name: "moradia3", description: 'Pagamentos de conta da casa3'},
      {id:4, name: "moradia4", description: 'Pagamentos de conta da casa4'},
      {id:5, name: "moradia5", description: 'Pagamentos de conta da casa5'}
    ]

    const entries: Entry[] = [
      {id: 1, name: 'Gás de Conzinha', categoryId: categories[0].id, paid: true, amount:"17,80", type: "expense", description: "Qualquer descrição ", category: categories[0] } as Entry
    ]

    return {categories, entries};
  }
}
