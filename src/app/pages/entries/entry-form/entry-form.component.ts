import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'

import { Entry } from '../shared/entry.model'
import { EntryService } from '../shared/entry.service'

import * as toastr from 'toastr'
import { switchMap } from 'rxjs/operators';
import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.scss']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();
  categories = Array<Category>();

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  }

  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ["Doming", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sabado"],
    dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
    dayNamesMin: ["Do","Se","Te","Qa","Qui","Sex","Sa"],
    monthNames: [ "Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro" ],
    monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun","Jul", "Ago", "Set", "Out", "Nov", "Dez" ],
    today: 'Hoje',
    clear: 'Limpar',
    //dateFormat: 'mm/dd/yy',
    //weekHeader: 'Wk'
};

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuild: FormBuilder,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
    this.loadCategories();
  }

  ngAfterContentChecked(){
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;

    if(this.currentAction == 'new'){
      this.createEntry();
    }else{
      this.updateEntry();
    }
  }

  get typeOptions(): Array<any> {
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return{
          text,
          value
        }
      }
    )
  }

  // privates METHODS
  private setCurrentAction(){
    if(this.route.snapshot.url[0].path === "new"){
      this.currentAction = "new"
    }else{
      this.currentAction = "edit"
    }
  }

  private buildEntryForm(){
    this.entryForm = this.formBuild.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2) ]],
      description: [null],
      type: ["expense"],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
      paid: [true]
    })
  }

  private loadEntry() {
    if(this.currentAction == "edit"){

      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get("id")))
      ).subscribe(
        (entry) => {
          this.entry = entry;
          this.entryForm.patchValue(entry)
        },
        (error) => alert("Ocorreu um erro no servidor, tente mais tarde")
      )
    }
  }

  private loadCategories(){
    this.categoryService.getAll().subscribe(
      categories => this.categories = categories
    )
  }

  private setPageTitle(){
    if(this.currentAction == 'new'){
      this.pageTitle = 'Cadastro de Novo Lançamento'
    }else{
      const entryName = this.entry.name || ''
      this.pageTitle = `Editando Lançamento ${entryName}`
    }
  }

  private createEntry(){
    const entry: Entry = Object.assign(
      new Entry(),
      this.entryForm.value
    )

    this.entryService.create(entry).subscribe(
      (entry) => this.actionsFormSuccess(entry),
      error => this.actionsForError(error)
    )
  }

  private updateEntry(){
    const entry: Entry = Object.assign(
      new Entry(),
      this.entryForm.value
    )

    this.entryService.update(entry);
  }

  private actionsFormSuccess(entry: Entry){
    toastr.success('Solicitação processada com sucesso')

    // redirect/reload component page
    this.router.navigateByUrl('entries', {skipLocationChange: true})
      .then(()=> this.router.navigate(['entries', entry.id, 'edit']))
  }

  private actionsForError(error){
    toastr.error("Ocorreu um erro ao processar sua operação")

    this.submittingForm = false;

    if(error.status === 422){
      this.serverErrorMessages = JSON.parse(error._body).errors;
    }else{
      this.serverErrorMessages = [
        "Falha na comunicação com o servidor. Por favor, teste mais tarde"
      ]
    }
  }
}
