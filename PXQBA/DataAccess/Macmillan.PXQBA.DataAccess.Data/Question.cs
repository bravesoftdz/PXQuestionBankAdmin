//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Macmillan.PXQBA.DataAccess.Data
{
    using System;
    using System.Collections.Generic;
    
    public partial class Question
    {
        public Question()
        {
            this.ProductCourses = new HashSet<ProductCourse>();
            this.Notes = new HashSet<Note>();
        }
    
        public int Id { get; set; }
        public string InteractionType { get; set; }
        public string DlapId { get; set; }
        public int Status { get; set; }
        public string Type { get; set; }
        public string Preview { get; set; }
    
        public virtual ICollection<ProductCourse> ProductCourses { get; set; }
        public virtual ICollection<Note> Notes { get; set; }
    }
}
