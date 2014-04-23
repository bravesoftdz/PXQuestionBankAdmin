﻿namespace Macmillan.PXQBA.Business.Commands.Contracts
{
    /// <summary>
    /// Is used for "workaround" operations that need to be done while editing question: copy question to temp course, editing it there, copy edited question back
    /// </summary>
    public interface ITemporaryQuestionOperation
    {
        /// <summary>
        /// Copies question from real course to temp course to increase editing speed
        /// </summary>
        /// <param name="questionIdToCopy"></param>
        void CopyQuestionToTemporaryQuiz(string questionIdToCopy);
    }
}