﻿/**
* @jsx React.DOM
*/

var UserBox = React.createClass({


    renderUsers: function(){
          var self = this;
         var rows = [];
         rows = this.props.users.map(function (user, i) {
        
            return (<UserRow user={user} showAvailibleTitlesHandler={self.props.showAvailibleTitlesHandler} showUserEditDialog={self.props.showUserEditDialog}/>);
          });

     return rows;
    },
    render: function() {
       return (<div>
                <div className="roles-table"> 

                  {this.renderUsers()}

                </div>
               
                </div>
            );
    }
});

