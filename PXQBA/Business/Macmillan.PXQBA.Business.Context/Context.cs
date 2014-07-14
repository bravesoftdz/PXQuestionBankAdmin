﻿using System;
using System.Configuration;
using System.Linq;
using AutoMapper;
using Bfw.Agilix.Commands;
using Bfw.Agilix.DataContracts;
using Bfw.Agilix.Dlap;
using Bfw.Agilix.Dlap.Session;
using Bfw.Common.Caching;
using Bfw.Common.Collections;
using Bfw.Common.Logging;
using Macmillan.PXQBA.Business.Models;
using Macmillan.PXQBA.Common.Helpers;

namespace Macmillan.PXQBA.Business
{
    /// <summary>
    /// Represents implementation of business context
    /// </summary>
    public class Context : IContext
    {
        private readonly ISessionManager sessionManager;
        private readonly ITraceManager tracer;
        private readonly ILogger logger;
        /// <summary>
        /// Gets or sets the cache provider.
        /// </summary>
        /// <value>
        /// The cache provider.
        /// </value>
        public ICacheProvider CacheProvider { get; protected set; }

        public Context(ISessionManager sessionManager, ILogger logger, ITraceManager tracer, ICacheProvider cacheProvider)
        {
            this.sessionManager = sessionManager;
            this.tracer = tracer;
            this.logger = logger;
            CacheProvider = cacheProvider;
        }

        public ISessionManager SessionManager
        {
            get
            {
                return sessionManager;
            }
        }

        public UserInfo CurrentUser { get; set; }

        /// <summary>
        /// Initializes session in current context
        /// </summary>
        /// <param name="loggedUserId">User name</param>
        public void Initialize(string loggedUserId)
        {
            InitializeUser(loggedUserId);
            InitializeSession(loggedUserId);
        }

        protected void InitializeUser(string userId)
        {
            using (tracer.StartTrace(String.Format("BusinessContext ExistingUser, parameters {0}", userId)))
            {
                var search = new GetUsers
                {
                    SearchParameters = new UserSearch()
                    {
                        ExternalId = userId,
                    }
                };

                var request = search.ToRequest();
                var response = AdminDlapConnection.Send(request);

                search.ParseResponse(response);

                if (!search.Users.IsNullOrEmpty())
                {
                    var agxUser = search.Users.First();
                    CurrentUser = Mapper.Map<UserInfo>(agxUser);
                }
            }
        }

        private void InitializeSession(string loggedUserId)
        {
            string domainUserName = string.Format("{0}/{1}", CurrentUser.DomainName, loggedUserId);
            var session = SessionManager.ResumeSession(domainUserName, CurrentUser.Id, null);
            if (session == null)
            {
                logger.Log("Could not resume session, starting new session", LogSeverity.Debug);
                session = sessionManager.StartNewSession(domainUserName, ConfigurationHelper.GetBrainhoneyDefaultPassword(), true, CurrentUser.Id);
            }
            session.UserId = CurrentUser.Id;
            sessionManager.CurrentSession = session;
        }

        private DlapConnection adminDlapConnection;

        protected DlapConnection AdminDlapConnection
        {
            get
            {
                if (adminDlapConnection == null)
                {
                    DlapConnection connection;

                    using (tracer.StartTrace("BusinessContext AdminConnection"))
                    {

                        var userId = ConfigurationHelper.GetAdministratorUserId();

                        var config = ConfigurationManager.GetSection("agilixSessionManager") as Bfw.Agilix.Dlap.Configuration.SessionManagerSection;

                        connection = ConnectionFactory.GetDlapConnection(config.Connection.Url);
                        connection.Tracer = tracer;
                        connection.Logger = logger;
                        connection.TrustHeaderKey = config.Connection.SecretKey;
                        connection.TrustHeaderUsername = userId;

                    }
                    adminDlapConnection = connection;
                }
                return adminDlapConnection;
            }
        }
    }
}
