﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Macmillan.PXQBA.Business.Commands.DataContracts;

namespace Macmillan.PXQBA.Business.Commands.Helpers
{
    /// <summary>
    /// Helper that is used to update the sequence of the question
    /// </summary>
    public class QuestionSequenceHelper
    {
        private static readonly string DecimalSeparator = System.Globalization.CultureInfo.CurrentCulture.NumberFormat.NumberDecimalSeparator;

        /// <summary>
        /// Implements the algorythm for question sequence updating:
        ///     1. New sequence is entered for the question. Let it be X
        ///     2. Look through all the questions and find questions #X and #(X+1). For instance their sequence values are Y and Y1. (if count of questions is less than X then new value is generated)
        ///     3. If Y = Y1 then look through the questions #(X+2), #(X+3) etc until Yn != Y(n+1).
        ///     4. For all the questions from point 3 update sequence value in order they become all different using formula Yn_new = (Yn + Y(n+1))/2
        ///     5. Insert updated question with sequence X between Y and Y1_new using formula (Y+Y1_new)/2
        /// </summary>
        /// <param name="questions">Questions to look through</param>
        /// <param name="questionId">Question id to change sequence for</param>
        /// <param name="newSequenceValue">New value of the sequence</param>
        /// <returns>Question list that should be updated</returns>
        public static IList<QuestionSearchResult> UpdateSequence(IList<QuestionSearchResult> questions, string questionId, int newSequenceValue)
        {
            var updated = new List<QuestionSearchResult>();

            questions.Insert(0, new QuestionSearchResult
            {
                QuestionId = "Dummy",
                SortingField = "0"
            });
            var oldSequenceValue = questions.ToList().FindIndex(q => q.QuestionId == questionId);
            var oldPosition = questions[oldSequenceValue];
            if (oldSequenceValue != newSequenceValue)
            {
                if (oldSequenceValue < newSequenceValue)
                {
                    newSequenceValue++;
                }
                decimal seq;
                var questionsWithDecimalSequence = questions.Where(q => decimal.TryParse(q.SortingField, out seq)).ToList();
                if (newSequenceValue >= questionsWithDecimalSequence.Count())
                {
                    oldPosition.SortingField = GetNewLastValue(questionsWithDecimalSequence);
                }
                else
                {
                    var nextPosition = questionsWithDecimalSequence[newSequenceValue];
                    var previousPosition = questionsWithDecimalSequence[newSequenceValue - 1];
                    var previousValue = decimal.Parse(previousPosition.SortingField);
                    var nextValue = decimal.Parse(nextPosition.SortingField);
                    if (nextValue == previousValue)
                    {
                        nextPosition = UpdateEqualValues(previousPosition, nextPosition, questionsWithDecimalSequence, newSequenceValue, updated, 0);
                        nextValue = decimal.Parse(nextPosition.SortingField);
                    }

                    oldPosition.SortingField = NewInsertedValue(previousValue, nextValue).ToString();
                }
                updated.Add(oldPosition);
            }
            return updated;
        }

        private static QuestionSearchResult UpdateEqualValues(QuestionSearchResult previousPosition, QuestionSearchResult nextPosition, List<QuestionSearchResult> questionsWithDecimalSequence, int newSequenceValue, IList<QuestionSearchResult> updated, int counter)
        {
            var recursionDepth = counter;
            var next = nextPosition;
            if (decimal.Parse(previousPosition.SortingField) == decimal.Parse(nextPosition.SortingField))
            {
                newSequenceValue++;
                if (newSequenceValue >= questionsWithDecimalSequence.Count())
                {
                    next.SortingField = GetNewLastValue(questionsWithDecimalSequence);
                }
                else
                {
                    next = UpdateEqualValues(nextPosition, questionsWithDecimalSequence[newSequenceValue], questionsWithDecimalSequence, newSequenceValue, updated, recursionDepth + 1);
                }
            }
            if (recursionDepth != 0)
            {
                previousPosition.SortingField = NewInsertedValue(decimal.Parse(previousPosition.SortingField), decimal.Parse(next.SortingField)).ToString();
                updated.Add(previousPosition);
                return previousPosition;
            }
            return next;
        }

        /// <summary>
        /// Gets next available sequence number
        /// </summary>
        /// <param name="questionsWithDecimalSequence">Questions which sequence value is floating number</param>
        /// <returns>New sequence number</returns>
        public static string GetNewLastValue(IEnumerable<QuestionSearchResult> questionsWithDecimalSequence)
        {
            decimal seq;
            var last = questionsWithDecimalSequence.LastOrDefault(q => decimal.TryParse(q.SortingField, out seq));
            if (last != null)
            {
                var lastValue = decimal.Parse(last.SortingField);
                return (Math.Floor(lastValue) + 1).ToString();
            }
            return "1";
        }


        private static decimal NewInsertedValue(decimal previousValue, decimal nextValue)
        {
            var decimalDigitsToRound = Math.Max(GetDecimalDigitsCount(nextValue.ToString()),
                        GetDecimalDigitsCount(previousValue.ToString()));
            var averageValueWithTolerance = Math.Abs(nextValue + previousValue) / 2; //+ 1 / Math.Pow(10, GetDecimalDigitsCount((Math.Abs(nextValue + previousValue) / 2).ToString()));
            var averageValueRounded = Math.Round(averageValueWithTolerance, decimalDigitsToRound, MidpointRounding.AwayFromZero);

            if (averageValueRounded == nextValue)
            {
                return Math.Abs(nextValue + previousValue) / 2;
            }
            else
            {
                return averageValueRounded;
            }
        }

        private static int GetDecimalDigitsCount(string number)
        {
            return number.Length -
                               (number.Contains(DecimalSeparator) ? number.IndexOf(DecimalSeparator) + 1 : number.Length);
        }
    }
}
