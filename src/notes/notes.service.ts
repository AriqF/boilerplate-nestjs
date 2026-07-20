import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './note.entity';

/** Demo repository usage: create + list notes through the injected TypeORM repository. */
@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notes: Repository<Note>,
  ) {}

  create(dto: CreateNoteDto): Promise<Note> {
    const note = this.notes.create(dto);
    return this.notes.save(note);
  }

  findAll(): Promise<Note[]> {
    return this.notes.find({ order: { createdAt: 'DESC' } });
  }
}
