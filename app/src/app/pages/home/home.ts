import { Component } from '@angular/core';
import { HeroBanner } from '../home/components/hero-banner/hero-banner';
import { QuizProfesionalIdeal } from '../home/components/quiz-profesional-ideal/quiz-profesional';
import { ServicesGrid } from '../home/components/services-grid/services-grid';
import { Specialties } from '../home/components/specialties/specialties';
import { QuoteStats } from '../home/components/quote-stats/quote-stats';

@Component({
  selector: 'app-home',
  imports: [HeroBanner, QuizProfesionalIdeal, ServicesGrid, Specialties, QuoteStats],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}
