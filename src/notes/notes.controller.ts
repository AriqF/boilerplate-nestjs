import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { CreateNoteDto } from './dto/create-note.dto';
import { Note } from './note.entity';
import { NotesService } from './notes.service';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Notes demo — persist a note via TypeORM' })
  @ResponseMessage('Note created')
  create(@Body() dto: CreateNoteDto): Promise<Note> {
    return this.notesService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Notes demo — list persisted notes' })
  @ResponseMessage('Notes fetched')
  findAll(): Promise<Note[]> {
    return this.notesService.findAll();
  }
}
