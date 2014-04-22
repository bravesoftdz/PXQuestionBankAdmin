﻿using System.Collections.Generic;
using Macmillan.PXQBA.Business.Models;

namespace Macmillan.PXQBA.Business.Commands.Contracts
{
    public interface INoteCommands
    {
        IEnumerable<Note> GetQuestionNotes(string questionId);
        Note CreateNote(Note note);
        void DeleteNote(Note note);
        Note UpdateNote(Note note);
    }
}