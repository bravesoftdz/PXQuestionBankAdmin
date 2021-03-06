/**
* @jsx React.DOM
*/
var NoteBox = React.createClass({displayName: 'NoteBox',
  loadNotes: function(data) {
   this.setState({data: data});

  },
  
  handleNoteSubmit: function(note) {
    var notes = this.state.data;
    var self = this;
    note.questionId = this.props.questionId;
    questionDataManager.createQuestionNote(this.props.currentCourseId, note).done(function(data){
    notes.push(data);
    self.setState({data: notes});
    })
    this.notesChangedHandler();
   
  },

  noteUpdateHandler: function(note){
    var notes = this.state.data;
    
     for (var i = 0; i < notes.length; i++) {
        var cur = notes[i];
        if (cur.id == note.id) {
            notes[i]= note;
            break;
        }
    }
    questionDataManager.saveQuestionNote(this.props.currentCourseId, note);
    this.setState({data: notes});

  },

  noteDeleteHandler: function(note) {
    var notes = this.state.data;
    for (var i = 0; i < notes.length; i++) {
        var cur = notes[i];
        if (cur.id == note.id) {
            notes.splice(i, 1);
            break;
        }
    }
    questionDataManager.deleteQuestionNote(this.props.currentCourseId, note);
    this.notesChangedHandler();
    this.setState({data: notes});

  },

  getInitialState: function() {
    return {data: [], notesChanged: false};
  },
  componentWillMount: function() {
    var response = questionDataManager.getQuestionNotes(this.props.questionId);
    response.done(this.loadNotes);
  },

  notesChangedHandler: function(){
    if(!this.state.notesChanged){
      this.setState({notesChanged: true});
      this.props.notesChangedHandler();
    }
  },

  render: function() {
    return (
      React.DOM.div({className: "note-box"}, 
        NoteList({data: this.state.data, onNoteDelete: this.noteDeleteHandler, onNoteUpdate: this.noteUpdateHandler, canDelete: this.props.canDelete}), 
        NoteForm({onNoteSubmit: this.handleNoteSubmit, questionId: this.props.questionId, canAddNote: this.props.canAddNote})
      )
    );
  }
});