using UnityEngine;

public class SliderMenuAnim : MonoBehaviour
{
  public GameObject PanelMenu;

  public void ShowHideMenu()
  {
    //yung ginagawa nito is nag checheck kung may laman yung PanelMenu
    //kung meron, kukunin yung animator nito
    if (PanelMenu != null)
    {
        
      Animator animator = PanelMenu.GetComponent<Animator>();
        //kung may laman yung animator, mag checheck kung open ba yung menu
        //kung open, iseset nya yung show sa false
        //kung hindi open, iseset nya yung show sa true
      if (animator != null)
      {
        bool isOpen = animator.GetBool("show");
        animator.SetBool("show", !isOpen);
      }
    }
  }
}
