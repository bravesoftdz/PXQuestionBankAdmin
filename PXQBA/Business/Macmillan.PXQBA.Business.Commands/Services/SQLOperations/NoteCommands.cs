﻿using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using Bfw.Common.Database;
using Macmillan.PXQBA.Business.Commands.Contracts;
using Note = Macmillan.PXQBA.Business.Models.Note;

namespace Macmillan.PXQBA.Business.Commands.Services.SQLOperations
{
    public class NoteCommands : INoteCommands
    {
        private readonly IDatabaseManager databaseManager;

        public NoteCommands(IDatabaseManager databaseManager)
        {
            this.databaseManager = databaseManager;
        }

        public IEnumerable<Note> GetQuestionNotes(string questionId)
        {
            DbCommand command = new SqlCommand();
            command.CommandType = CommandType.StoredProcedure;
            command.CommandText = "dbo.GetQBANotes";

            var questionIdParam = new SqlParameter("@questionId", questionId);
            command.Parameters.Add(questionIdParam);

            var dbRecords = databaseManager.Query(command);

            return GetNotesFromRecords(dbRecords);
        }

        public Note CreateNote(Note note)
        {
            DbCommand command = new SqlCommand();
            command.CommandType = CommandType.StoredProcedure;
            command.CommandText = "dbo.CreateQBANote";
           

            var questionIdParam = new SqlParameter("@questionId", note.QuestionId);
            command.Parameters.Add(questionIdParam);

            var text = new SqlParameter("@noteText", note.Text);
            command.Parameters.Add(text);


            var noteId = new SqlParameter("@noteId", SqlDbType.BigInt);
            noteId.Direction = ParameterDirection.ReturnValue;
            command.Parameters.Add(noteId);
            ExecureNonQueryCommand(command);

            if (noteId.Value != null)
            {
                note.Id = (int) noteId.Value;
            }
            return note;
        }

        public void DeleteNote(Note note)
        {
            DbCommand command = new SqlCommand();
            command.CommandType = CommandType.StoredProcedure;
            command.CommandText = "dbo.DeleteQBANote";

            var noteId = new SqlParameter("@noteId", note.Id);
            command.Parameters.Add(noteId);
            ExecureNonQueryCommand(command);
        }

        public Note UpdateNote(Note note)
        {

            DbCommand command = new SqlCommand();
            command.CommandType = CommandType.StoredProcedure;
            command.CommandText = "dbo.UpdateQBANote";

            var noteId = new SqlParameter("@noteId", note.Id);
            command.Parameters.Add(noteId);

            var text = new SqlParameter("@noteText", note.Text);
            command.Parameters.Add(text);

            ExecureNonQueryCommand(command);

            return note;
        }

        private IEnumerable<Note> GetNotesFromRecords(IEnumerable<DatabaseRecord> dbRecords)
        {
            return dbRecords.Select(databaseRecord => new Note()
                                                           {
                                                               Id = (long) databaseRecord["Id"],
                                                               QuestionId = (string) databaseRecord["QuestionId"], 
                                                               Text = (string) databaseRecord["NoteText"]
                                                           }).ToList();
            
        }

        private void ExecureNonQueryCommand(DbCommand command)
        {
            try
            {
                databaseManager.StartSession();
                databaseManager.ExecuteNonQuery(command);
            }
            finally
            {

                databaseManager.EndSession();
            }
            
        }
    }
}