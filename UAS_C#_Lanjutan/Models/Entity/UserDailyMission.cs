using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("UserDailyMissions")]
    public class UserDailyMission
    {
        [Key]
        public int Id { get; set; }

        [Column("UserId")]
        public int UserId { get; set; }

        [Column("SlotNumber")]
        public int SlotNumber { get; set; }

        [Column("MissionType")]
        public string MissionType { get; set; }

        [Column("MenuName")]
        public string MenuName { get; set; }

        [Column("TargetProgress")]
        public int TargetProgress { get; set; }

        [Column("CurrentProgress")]
        public int CurrentProgress { get; set; }

        [Column("IsCompleted")]
        public bool IsCompleted { get; set; }

        [Column("IsClaimed")]
        public bool IsClaimed { get; set; }

        [Column("AssignedDate")]
        public DateTime AssignedDate { get; set; }
    }
}
