﻿using Macmillan.PXQBA.Business.Commands.Contracts;
using Macmillan.PXQBA.Business.Contracts;
using Macmillan.PXQBA.Business.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace Macmillan.PXQBA.Business.Services.Tests
{
    [TestClass]
    public class NotesManagementServiceTest
    {
        private INoteCommands noteCommands;

        private INotesManagementService notsNotesManagementService;


        [TestInitialize]
        public void TestInitialize()
        {
            noteCommands = Substitute.For<INoteCommands>();
            notsNotesManagementService = new NotesManagementService(noteCommands);
        }

        [TestMethod] 
        public void GetQuestionNotes_SomeQuestionId_CorrectCommandInvoked()
        {
            const string questionId = "q123";

            bool isCorrectInvoked = false;

            noteCommands.When(r => r.GetQuestionNotes(Arg.Is<string>(a => a == questionId)))
                        .Do(d => { isCorrectInvoked = true; });

            notsNotesManagementService.GetQuestionNotes(questionId);

            Assert.IsTrue(isCorrectInvoked);
        }


        [TestMethod]
        public void CreateNote_SomeNote_CorrectCommandInvoked()
        {
            const long noteId = 123;
            Note note = new Note()
                        {
                            Id = noteId
                        };

            bool isCorrectInvoked = false;

            noteCommands.When(r => r.CreateNote(Arg.Is<Note>(a => a.Id==noteId)))
                        .Do(d => { isCorrectInvoked = true; });

            notsNotesManagementService.CreateNote(note);

            Assert.IsTrue(isCorrectInvoked);
        }


        [TestMethod]
        public void DeleteNote_SomeNote_CorrectCommandInvoked()
        {
            const long noteId = 123;
            Note note = new Note()
            {
                Id = noteId
            };

            bool isCorrectInvoked = false;

            noteCommands.When(r => r.DeleteNote(Arg.Is<Note>(a => a.Id == noteId)))
                        .Do(d => { isCorrectInvoked = true; });

            notsNotesManagementService.DeleteNote(note);

            Assert.IsTrue(isCorrectInvoked);
        }

        [TestMethod]
        public void SaveNote_SomeNote_CorrectCommandInvoked()
        {
            const long noteId = 123;
            Note note = new Note()
            {
                Id = noteId
            };

            bool isCorrectInvoked = false;

            noteCommands.When(r => r.UpdateNote(Arg.Is<Note>(a => a.Id == noteId)))
                        .Do(d => { isCorrectInvoked = true; });

            notsNotesManagementService.SaveNote(note);

            Assert.IsTrue(isCorrectInvoked);
        }


    }
}
