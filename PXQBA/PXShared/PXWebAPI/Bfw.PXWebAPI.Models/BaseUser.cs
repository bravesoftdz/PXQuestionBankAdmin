﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Bfw.PXWebAPI.Models
{
    public class BaseUser
    {
        /// <summary>
        /// ID of the user.
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// User's first name.
        /// </summary>

        public string FirstName { get; set; }

        /// <summary>
        /// User's last name.
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Gets the user's first and last names together in a string.
        /// </summary>
        public string FormattedName
        {
            get { return String.Format("{0} {1}", FirstName, LastName); }
        }

        /// <summary>
        /// User's e-mail address.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Username of the user.
        /// </summary>
        public string Username { get; set; }
      
        /// <summary>
        /// Date and time of the user's last login. Set to DateRule.MinDate if the user hasn't logged in.
        /// </summary>
        public DateTime? LastLogin { get; set; }

        /// <summary>
        /// ID of the user's domain.
        /// </summary>
        public string DomainId { get; set; }

        /// <summary>
        /// Name of the user's domain.
        /// </summary>
        public string DomainName { get; set; }

        /// <summary>
        /// User's External ID.
        /// </summary>
        public string ReferenceId { get; set; }
      
    }
}
